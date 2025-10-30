import { Router } from 'express';
import { MongoStorage } from '../mongoStorage';
import { authenticateToken } from '../middleware/auth';

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

// Platform-wide revenue analytics
router.get('/revenue', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { db } = storage;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const matchQuery: any = { status: 'completed' };
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(String(startDate));
      if (endDate) matchQuery.timestamp.$lte = new Date(String(endDate));
    }

    // Determine date format based on groupBy
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') dateFormat = '%Y-%m';
    if (groupBy === 'year') dateFormat = '%Y';

    // Get revenue trends
    const revenueTrends = await db.collection('queues').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
          revenue: { $sum: { $toDouble: '$totalPrice' } },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
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
          revenue: 1,
          bookings: 1
        }
      }
    ]).toArray();

    res.json({
      trends: revenueTrends,
      topSalons: revenueBySalon,
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

export default router;
