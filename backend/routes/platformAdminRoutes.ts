import { Router } from 'express';
import { MongoStorage } from '../mongoStorage';
import { authenticateToken } from '../middleware/auth';
import { Parser } from 'json2csv';

const router = Router();
const storage = new MongoStorage();

// Middleware to check if user is super admin
const requireSuperAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await storage.getUser(req.user.userId);
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization check failed', error });
  }
};

// Platform-wide statistics
router.get('/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;

    // Get total counts
    const [totalSalons, totalUsers, totalBookings, totalServices] = await Promise.all([
      db.collection('salons').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('queues').countDocuments(),
      db.collection('services').countDocuments(),
    ]);

    // Get booking statistics
    const bookingStats = await db.collection('queues').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get revenue statistics (completed bookings)
    const revenueData = await db.collection('queues').aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$totalPrice' } },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newSalons = await db.collection('salons').countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get active salons (with bookings in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeSalons = await db.collection('queues').distinct('salonId', {
      timestamp: { $gte: sevenDaysAgo }
    });

    res.json({
      overview: {
        totalSalons,
        totalUsers,
        totalBookings,
        totalServices,
        activeSalons: activeSalons.length,
      },
      bookings: {
        byStatus: bookingStats.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        total: totalBookings,
      },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        completedBookings: revenueData[0]?.count || 0,
        averageBookingValue: revenueData[0]?.totalRevenue && revenueData[0]?.count
          ? revenueData[0].totalRevenue / revenueData[0].count
          : 0,
      },
      growth: {
        newUsersLast30Days: newUsers,
        newSalonsLast30Days: newSalons,
      },
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ message: 'Failed to fetch platform statistics', error });
  }
});

// Get all salons with metrics
router.get('/salons', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ]
    } : {};

    // Get salons with owner info
    const salons = await db.collection('salons').aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: 'id',
          as: 'owner'
        }
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: 1,
          name: 1,
          address: 1,
          type: 1,
          rating: 1,
          createdAt: 1,
          'owner.id': 1,
          'owner.name': 1,
          'owner.email': 1,
          'owner.phone': 1,
        }
      },
      { $sort: { [String(sortBy)]: sortOrder === 'asc' ? 1 : -1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ]).toArray();

    // Get metrics for each salon
    const salonsWithMetrics = await Promise.all(salons.map(async (salon) => {
      const [totalBookings, completedBookings, revenue, services] = await Promise.all([
        db.collection('queues').countDocuments({ salonId: salon.id }),
        db.collection('queues').countDocuments({ salonId: salon.id, status: 'completed' }),
        db.collection('queues').aggregate([
          { $match: { salonId: salon.id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
        ]).toArray(),
        db.collection('services').countDocuments({ salonId: salon.id }),
      ]);

      return {
        ...salon,
        metrics: {
          totalBookings,
          completedBookings,
          revenue: revenue[0]?.total || 0,
          services,
        }
      };
    }));

    const total = await db.collection('salons').countDocuments(searchQuery);

    res.json({
      salons: salonsWithMetrics,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (error) {
    console.error('Get salons error:', error);
    res.status(500).json({ message: 'Failed to fetch salons', error });
  }
});

// Get individual salon details
router.get('/salon/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const salon = await storage.getSalon(id);

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Get owner details
    const owner = await storage.getUser(salon.ownerId);

    // Get salon metrics
    const { db } = storage;
    const [services, bookings, reviews, revenue] = await Promise.all([
      db.collection('services').find({ salonId: id }).toArray(),
      db.collection('queues').find({ salonId: id }).sort({ timestamp: -1 }).limit(50).toArray(),
      db.collection('reviews').find({ salonId: id }).sort({ createdAt: -1 }).limit(20).toArray(),
      db.collection('queues').aggregate([
        { $match: { salonId: id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
      ]).toArray(),
    ]);

    res.json({
      salon,
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone } : null,
      metrics: {
        totalServices: services.length,
        totalBookings: bookings.length,
        totalReviews: reviews.length,
        totalRevenue: revenue[0]?.total || 0,
      },
      services,
      recentBookings: bookings,
      recentReviews: reviews,
    });
  } catch (error) {
    console.error('Get salon details error:', error);
    res.status(500).json({ message: 'Failed to fetch salon details', error });
  }
});

// Platform-wide booking analytics
router.get('/bookings', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { startDate, endDate, status } = req.query;

    const matchQuery: any = {};
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(String(startDate));
      if (endDate) matchQuery.timestamp.$lte = new Date(String(endDate));
    }
    if (status) matchQuery.status = status;

    // Get booking trends by day
    const bookingTrends = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          revenue: { $sum: { $toDouble: '$totalPrice' } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Get most popular services
    const popularServices = await db.collection('queues').aggregate([
      { $match: matchQuery },
      { $unwind: '$serviceIds' },
      {
        $group: {
          _id: '$serviceIds',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $project: {
          serviceId: '$_id',
          serviceName: '$service.name',
          count: 1
        }
      }
    ]).toArray();

    // Get peak booking hours
    const peakHours = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json({
      trends: bookingTrends,
      popularServices,
      peakHours,
    });
  } catch (error) {
    console.error('Booking analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch booking analytics', error });
  }
});

// Enhanced revenue analytics with date filters and comparisons
router.get('/revenue', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { startDate, endDate, groupBy = 'day', compareWithPrevious = 'false' } = req.query;

    const matchQuery: any = { status: 'completed' };
    let currentPeriodStart = startDate ? new Date(String(startDate)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let currentPeriodEnd = endDate ? new Date(String(endDate)) : new Date();

    matchQuery.timestamp = {
      $gte: currentPeriodStart,
      $lte: currentPeriodEnd
    };

    // Determine date format based on groupBy
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') dateFormat = '%Y-%m';
    if (groupBy === 'year') dateFormat = '%Y';
    if (groupBy === 'week') dateFormat = '%Y-W%V';

    // Get revenue trends for current period
    const revenueTrends = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
          revenue: { $sum: { $toDouble: '$totalPrice' } },
          bookings: { $sum: 1 },
          avgBookingValue: { $avg: { $toDouble: '$totalPrice' } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Calculate total for current period
    const currentTotal = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$totalPrice' } },
          totalBookings: { $sum: 1 },
          avgBookingValue: { $avg: { $toDouble: '$totalPrice' } }
        }
      }
    ]).toArray();

    let comparison = null;
    if (compareWithPrevious === 'true') {
      // Calculate previous period dates
      const periodLength = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
      const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
      const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodLength);

      const previousMatchQuery = {
        status: 'completed',
        timestamp: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd
        }
      };

      const previousTotal = await db.collection('queues').aggregate([
        { $match: previousMatchQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $toDouble: '$totalPrice' } },
            totalBookings: { $sum: 1 },
            avgBookingValue: { $avg: { $toDouble: '$totalPrice' } }
          }
        }
      ]).toArray();

      if (previousTotal.length > 0 && currentTotal.length > 0) {
        const prevRev = previousTotal[0].totalRevenue || 0;
        const currRev = currentTotal[0].totalRevenue || 0;
        const prevBookings = previousTotal[0].totalBookings || 0;
        const currBookings = currentTotal[0].totalBookings || 0;

        comparison = {
          revenueChange: prevRev > 0 ? ((currRev - prevRev) / prevRev) * 100 : 0,
          bookingsChange: prevBookings > 0 ? ((currBookings - prevBookings) / prevBookings) * 100 : 0,
          previousPeriod: {
            revenue: prevRev,
            bookings: prevBookings,
            avgBookingValue: previousTotal[0].avgBookingValue || 0
          }
        };
      }
    }

    // Get revenue by salon type
    const revenueBySalonType = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'salons',
          localField: 'salonId',
          foreignField: 'id',
          as: 'salon'
        }
      },
      { $unwind: '$salon' },
      {
        $group: {
          _id: '$salon.type',
          revenue: { $sum: { $toDouble: '$totalPrice' } },
          bookings: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get revenue by salon (top 10)
    const revenueBySalon = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$salonId',
          revenue: { $sum: { $toDouble: '$totalPrice' } },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'salons',
          localField: '_id',
          foreignField: 'id',
          as: 'salon'
        }
      },
      { $unwind: '$salon' },
      {
        $project: {
          salonId: '$_id',
          salonName: '$salon.name',
          salonType: '$salon.type',
          revenue: 1,
          bookings: 1,
          avgBookingValue: { $divide: ['$revenue', '$bookings'] }
        }
      }
    ]).toArray();

    res.json({
      trends: revenueTrends,
      topSalons: revenueBySalon,
      bySalonType: revenueBySalonType,
      summary: currentTotal[0] || { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 },
      comparison,
      period: {
        start: currentPeriodStart,
        end: currentPeriodEnd,
        groupBy
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch revenue analytics', error });
  }
});

// User analytics
router.get('/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { page = 1, limit = 20, role, search = '' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const matchQuery: any = {};
    if (role) matchQuery.role = role;
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await db.collection('users').find(matchQuery)
      .project({ password: 0, phoneOTP: 0, emailOTP: 0, otpExpiry: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const total = await db.collection('users').countDocuments(matchQuery);

    // Get user role distribution
    const roleDistribution = await db.collection('users').aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get user growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await db.collection('users').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      roleDistribution,
      userGrowth,
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch user analytics', error });
  }
});

// Salon performance scoring and ranking
router.get('/salon-performance', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { limit = 50, sortBy = 'score' } = req.query;

    // Get all salons with their metrics
    const salons = await db.collection('salons').find().toArray();

    const salonPerformance = await Promise.all(salons.map(async (salon) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get booking metrics
      const [totalBookings, completedBookings, cancelledBookings, noShows, revenue, avgRating, responseTime] = await Promise.all([
        db.collection('queues').countDocuments({ salonId: salon.id }),
        db.collection('queues').countDocuments({ salonId: salon.id, status: 'completed' }),
        db.collection('queues').countDocuments({ 
          salonId: salon.id, 
          status: { $in: ['cancelled', 'no-show'] } 
        }),
        db.collection('queues').countDocuments({ salonId: salon.id, status: 'no-show' }),
        db.collection('queues').aggregate([
          { $match: { salonId: salon.id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
        ]).toArray(),
        db.collection('reviews').aggregate([
          { $match: { salonId: salon.id } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]).toArray(),
        // Calculate average response time (time from waiting to in-progress)
        db.collection('queues').aggregate([
          { 
            $match: { 
              salonId: salon.id, 
              status: { $in: ['in-progress', 'completed'] },
              serviceStartedAt: { $exists: true }
            } 
          },
          {
            $project: {
              responseTime: { 
                $subtract: ['$serviceStartedAt', '$timestamp'] 
              }
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]).toArray()
      ]);

      // Get recent activity (last 30 days)
      const recentBookings = await db.collection('queues').countDocuments({
        salonId: salon.id,
        timestamp: { $gte: thirtyDaysAgo }
      });

      const recentRevenue = await db.collection('queues').aggregate([
        { 
          $match: { 
            salonId: salon.id, 
            status: 'completed',
            timestamp: { $gte: thirtyDaysAgo }
          } 
        },
        { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
      ]).toArray();

      // Calculate performance score (0-100)
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
      const noShowRate = totalBookings > 0 ? (noShows / totalBookings) * 100 : 0;
      const rating = avgRating[0]?.avg || 0;
      const avgResponseMinutes = responseTime[0]?.avgResponseTime ? responseTime[0].avgResponseTime / (1000 * 60) : 0;

      // Scoring algorithm (weighted)
      let score = 0;
      score += Math.min(completionRate * 0.3, 30); // 30% weight for completion rate
      score += Math.min(rating * 4, 20); // 20% weight for rating (max 5 stars)
      score += Math.max(20 - noShowRate * 2, 0); // 20% weight for low no-show rate
      score += Math.min((recentBookings / 30) * 2, 15); // 15% weight for activity
      score += Math.max(15 - (avgResponseMinutes / 10), 0); // 15% weight for fast response

      return {
        salonId: salon.id,
        salonName: salon.name,
        salonType: salon.type,
        address: salon.address,
        score: Math.round(score * 10) / 10,
        metrics: {
          totalBookings,
          completedBookings,
          completionRate: Math.round(completionRate * 10) / 10,
          cancelledBookings,
          noShows,
          noShowRate: Math.round(noShowRate * 10) / 10,
          totalRevenue: revenue[0]?.total || 0,
          avgRating: Math.round((rating || 0) * 10) / 10,
          avgResponseTimeMinutes: Math.round(avgResponseMinutes),
          recentBookings30Days: recentBookings,
          recentRevenue30Days: recentRevenue[0]?.total || 0
        },
        healthStatus: score >= 70 ? 'excellent' : score >= 50 ? 'good' : score >= 30 ? 'fair' : 'poor'
      };
    }));

    // Sort by score or other criteria
    salonPerformance.sort((a, b) => {
      let aVal: number, bVal: number;
      
      if (sortBy === 'revenue') {
        aVal = a.metrics.totalRevenue;
        bVal = b.metrics.totalRevenue;
      } else if (sortBy === 'bookings') {
        aVal = a.metrics.totalBookings;
        bVal = b.metrics.totalBookings;
      } else {
        aVal = a.score;
        bVal = b.score;
      }
      
      return bVal - aVal;
    });

    res.json({
      salons: salonPerformance.slice(0, Number(limit)),
      summary: {
        totalSalons: salons.length,
        avgScore: salonPerformance.reduce((sum, s) => sum + s.score, 0) / salons.length,
        excellentSalons: salonPerformance.filter(s => s.healthStatus === 'excellent').length,
        poorSalons: salonPerformance.filter(s => s.healthStatus === 'poor').length
      }
    });
  } catch (error) {
    console.error('Salon performance error:', error);
    res.status(500).json({ message: 'Failed to fetch salon performance', error });
  }
});

// User segmentation and LTV (Lifetime Value)
router.get('/user-segmentation', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Get all users with their booking history
    const users = await db.collection('users').find({ role: 'customer' }).toArray();

    const userSegments = await Promise.all(users.map(async (user) => {
      // Get user's booking stats
      const [totalBookings, completedBookings, totalSpent, recentBookings, firstBooking, lastBooking] = await Promise.all([
        db.collection('queues').countDocuments({ userId: user.id }),
        db.collection('queues').countDocuments({ userId: user.id, status: 'completed' }),
        db.collection('queues').aggregate([
          { $match: { userId: user.id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
        ]).toArray(),
        db.collection('queues').countDocuments({
          userId: user.id,
          timestamp: { $gte: thirtyDaysAgo }
        }),
        db.collection('queues').find({ userId: user.id }).sort({ timestamp: 1 }).limit(1).toArray(),
        db.collection('queues').find({ userId: user.id }).sort({ timestamp: -1 }).limit(1).toArray()
      ]);

      const ltv = totalSpent[0]?.total || 0;
      const avgBookingValue = completedBookings > 0 ? ltv / completedBookings : 0;
      const daysSinceFirstBooking = firstBooking[0] ? 
        (Date.now() - new Date(firstBooking[0].timestamp).getTime()) / (1000 * 60 * 60 * 24) : 0;
      const daysSinceLastBooking = lastBooking[0] ? 
        (Date.now() - new Date(lastBooking[0].timestamp).getTime()) / (1000 * 60 * 60 * 24) : 999;

      // Determine segment
      let segment = 'new';
      if (totalBookings === 0) {
        segment = 'inactive';
      } else if (daysSinceLastBooking > 90) {
        segment = 'churned';
      } else if (recentBookings >= 4) {
        segment = 'power_user';
      } else if (totalBookings >= 5 && recentBookings >= 1) {
        segment = 'loyal';
      } else if (totalBookings >= 2) {
        segment = 'regular';
      } else if (totalBookings === 1 && daysSinceFirstBooking <= 30) {
        segment = 'new';
      }

      return {
        userId: user.id,
        userName: user.name,
        email: user.email,
        segment,
        metrics: {
          totalBookings,
          completedBookings,
          lifetimeValue: Math.round(ltv * 100) / 100,
          avgBookingValue: Math.round(avgBookingValue * 100) / 100,
          recentBookings30Days: recentBookings,
          daysSinceFirstBooking: Math.round(daysSinceFirstBooking),
          daysSinceLastBooking: Math.round(daysSinceLastBooking),
          accountAge: Math.round((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        }
      };
    }));

    // Aggregate by segment
    const segmentSummary = userSegments.reduce((acc, user) => {
      if (!acc[user.segment]) {
        acc[user.segment] = {
          count: 0,
          totalLTV: 0,
          avgLTV: 0,
          totalBookings: 0
        };
      }
      acc[user.segment].count++;
      acc[user.segment].totalLTV += user.metrics.lifetimeValue;
      acc[user.segment].totalBookings += user.metrics.totalBookings;
      return acc;
    }, {} as any);

    // Calculate averages
    Object.keys(segmentSummary).forEach(segment => {
      segmentSummary[segment].avgLTV = segmentSummary[segment].totalLTV / segmentSummary[segment].count;
      segmentSummary[segment].avgBookings = segmentSummary[segment].totalBookings / segmentSummary[segment].count;
    });

    // Get top users by LTV
    const topUsers = userSegments
      .sort((a, b) => b.metrics.lifetimeValue - a.metrics.lifetimeValue)
      .slice(0, 20);

    res.json({
      segments: segmentSummary,
      topUsers,
      totalUsers: users.length,
      totalLTV: userSegments.reduce((sum, u) => sum + u.metrics.lifetimeValue, 0)
    });
  } catch (error) {
    console.error('User segmentation error:', error);
    res.status(500).json({ message: 'Failed to fetch user segmentation', error });
  }
});

// Booking cancellation analysis
router.get('/cancellation-analysis', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { startDate, endDate } = req.query;

    const matchQuery: any = {
      status: { $in: ['no-show', 'cancelled'] }
    };

    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(String(startDate));
      if (endDate) matchQuery.timestamp.$lte = new Date(String(endDate));
    }

    // Get cancellation trends over time
    const cancellationTrends = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]).toArray();

    // Get cancellations by salon
    const cancellationsBySalon = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$salonId',
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'salons',
          localField: '_id',
          foreignField: 'id',
          as: 'salon'
        }
      },
      { $unwind: '$salon' },
      {
        $project: {
          salonId: '$_id',
          salonName: '$salon.name',
          noShows: 1,
          cancelled: 1,
          total: 1
        }
      }
    ]).toArray();

    // Get cancellation reasons (if stored in noShowReason field)
    const cancellationReasons = await db.collection('queues').aggregate([
      { 
        $match: { 
          ...matchQuery,
          noShowReason: { $exists: true, $ne: null }
        } 
      },
      {
        $group: {
          _id: '$noShowReason',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Calculate overall statistics
    const totalCancellations = await db.collection('queues').countDocuments(matchQuery);
    const totalBookings = await db.collection('queues').countDocuments({
      timestamp: matchQuery.timestamp
    });
    const cancellationRate = totalBookings > 0 ? (totalCancellations / totalBookings) * 100 : 0;

    // Get time-based patterns (hour of day)
    const cancellationsByHour = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Get day of week patterns
    const cancellationsByDayOfWeek = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dayOfWeek: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json({
      summary: {
        totalCancellations,
        totalBookings,
        cancellationRate: Math.round(cancellationRate * 100) / 100
      },
      trends: cancellationTrends,
      bySalon: cancellationsBySalon,
      reasons: cancellationReasons,
      patterns: {
        byHour: cancellationsByHour,
        byDayOfWeek: cancellationsByDayOfWeek
      }
    });
  } catch (error) {
    console.error('Cancellation analysis error:', error);
    res.status(500).json({ message: 'Failed to fetch cancellation analysis', error });
  }
});

// Export reports (CSV/Excel)
router.get('/export/revenue', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { startDate, endDate, format = 'csv' } = req.query;

    const matchQuery: any = { status: 'completed' };
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(String(startDate));
      if (endDate) matchQuery.timestamp.$lte = new Date(String(endDate));
    }

    // Get detailed revenue data
    const revenueData = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'salons',
          localField: 'salonId',
          foreignField: 'id',
          as: 'salon'
        }
      },
      { $unwind: '$salon' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          time: { $dateToString: { format: '%H:%M:%S', date: '$timestamp' } },
          bookingId: '$id',
          salonName: '$salon.name',
          salonType: '$salon.type',
          customerName: '$user.name',
          customerEmail: '$user.email',
          revenue: { $toDouble: '$totalPrice' },
          status: '$status',
          serviceCount: { $size: '$serviceIds' }
        }
      },
      { $sort: { date: -1, time: -1 } }
    ]).toArray();

    if (format === 'csv') {
      const fields = ['date', 'time', 'bookingId', 'salonName', 'salonType', 'customerName', 'customerEmail', 'revenue', 'status', 'serviceCount'];
      const parser = new Parser({ fields });
      const csv = parser.parse(revenueData);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename="revenue-report-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.json(revenueData);
    }
  } catch (error) {
    console.error('Export revenue error:', error);
    res.status(500).json({ message: 'Failed to export revenue data', error });
  }
});

router.get('/export/salons', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { format = 'csv' } = req.query;

    // Get all salons with metrics
    const salons = await db.collection('salons').find().toArray();
    
    const salonData = await Promise.all(salons.map(async (salon) => {
      const [totalBookings, completedBookings, revenue, services, avgRating] = await Promise.all([
        db.collection('queues').countDocuments({ salonId: salon.id }),
        db.collection('queues').countDocuments({ salonId: salon.id, status: 'completed' }),
        db.collection('queues').aggregate([
          { $match: { salonId: salon.id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
        ]).toArray(),
        db.collection('services').countDocuments({ salonId: salon.id }),
        db.collection('reviews').aggregate([
          { $match: { salonId: salon.id } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]).toArray()
      ]);

      return {
        salonId: salon.id,
        name: salon.name,
        type: salon.type,
        address: salon.address,
        createdAt: new Date(salon.createdAt).toISOString().split('T')[0],
        totalBookings,
        completedBookings,
        totalRevenue: revenue[0]?.total || 0,
        totalServices: services,
        avgRating: avgRating[0]?.avg || 0,
        rating: salon.rating
      };
    }));

    if (format === 'csv') {
      const fields = ['salonId', 'name', 'type', 'address', 'createdAt', 'totalBookings', 'completedBookings', 'totalRevenue', 'totalServices', 'avgRating', 'rating'];
      const parser = new Parser({ fields });
      const csv = parser.parse(salonData);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename="salons-report-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.json(salonData);
    }
  } catch (error) {
    console.error('Export salons error:', error);
    res.status(500).json({ message: 'Failed to export salon data', error });
  }
});

router.get('/export/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { format = 'csv', segment } = req.query;

    const users = await db.collection('users').find({ role: 'customer' }).toArray();

    const userData = await Promise.all(users.map(async (user) => {
      const [totalBookings, completedBookings, totalSpent] = await Promise.all([
        db.collection('queues').countDocuments({ userId: user.id }),
        db.collection('queues').countDocuments({ userId: user.id, status: 'completed' }),
        db.collection('queues').aggregate([
          { $match: { userId: user.id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$totalPrice' } } } }
        ]).toArray()
      ]);

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: new Date(user.createdAt).toISOString().split('T')[0],
        totalBookings,
        completedBookings,
        lifetimeValue: totalSpent[0]?.total || 0,
        loyaltyPoints: user.loyaltyPoints || 0
      };
    }));

    if (format === 'csv') {
      const fields = ['userId', 'name', 'email', 'phone', 'createdAt', 'totalBookings', 'completedBookings', 'lifetimeValue', 'loyaltyPoints'];
      const parser = new Parser({ fields });
      const csv = parser.parse(userData);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename="users-report-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.json(userData);
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Failed to export user data', error });
  }
});

export default router;
