import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Bell,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Trash2,
    AlertTriangle,
    ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [notifications, setNotifications] = useState({
        queueUpdates: true,
        promotions: false,
        reminders: true,
        newsletter: false
    });

    const [privacy, setPrivacy] = useState({
        profileVisible: true,
        showLocation: false,
        showPhone: false,
        allowMessages: true
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordUpdate = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toast({
                title: "Missing fields",
                description: "Please fill in all password fields",
                variant: "destructive",
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "New password and confirm password must match",
                variant: "destructive",
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        try {
            const token = localStorage.getItem('smartq_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app'}/api/user/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update password');
            }

            toast({
                title: "Password updated!",
                description: "Your password has been changed successfully.",
            });

            // Clear form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error.message || "Failed to update password",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('smartq_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app'}/api/user/account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    password: deletePassword || undefined
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete account');
            }

            toast({
                title: "Account deleted",
                description: "Your account has been permanently deleted.",
            });

            // Clear local storage and logout
            localStorage.removeItem('smartq_token');
            localStorage.removeItem('smartq_user');
            logout();

            // Redirect to home page
            setTimeout(() => {
                setLocation('/');
            }, 1000);

        } catch (error: any) {
            toast({
                title: "Deletion failed",
                description: error.message || "Failed to delete account",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setDeletePassword("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-base sm:text-xl text-gray-600 mt-2">
                        Manage your preferences and security
                    </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {/* Notifications */}
                    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl mx-1">
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                                <Bell className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-600" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            {key === 'queueUpdates' && 'Get notified about queue status changes'}
                                            {key === 'promotions' && 'Receive promotional offers and deals'}
                                            {key === 'reminders' && 'Get reminders about upcoming appointments'}
                                            {key === 'newsletter' && 'Receive our weekly newsletter'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={value}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, [key]: checked })
                                        }
                                        className="flex-shrink-0"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Privacy Settings */}
                    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl mx-1">
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600" />
                                Privacy Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            {Object.entries(privacy).map(([key, value]) => (
                                <div key={key} className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            {key === 'profileVisible' && 'Make your profile visible to other users'}
                                            {key === 'showLocation' && 'Display your location on your profile'}
                                            {key === 'showPhone' && 'Show your phone number to salons'}
                                            {key === 'allowMessages' && 'Allow other users to send you messages'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={value}
                                        onCheckedChange={(checked) =>
                                            setPrivacy({ ...privacy, [key]: checked })
                                        }
                                        className="flex-shrink-0"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Password Change */}
                    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl mx-1">
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        name="currentPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        New Password
                                    </label>
                                    <Input
                                        name="newPassword"
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Confirm Password
                                    </label>
                                    <Input
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handlePasswordUpdate}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full sm:w-auto"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Update Password
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Delete Account Section */}
                    <Card className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50 mx-1">
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-red-600 flex items-center">
                                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                <div className="flex items-start space-x-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-red-900 mb-2">Delete Your Account</h3>
                                        <p className="text-sm text-red-700 mb-2">
                                            Once you delete your account, there is no going back. This action will:
                                        </p>
                                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                            <li>Permanently delete your profile and data</li>
                                            <li>Remove all your reviews and ratings</li>
                                            <li>Cancel any active queue bookings</li>
                                            <li>Delete your profile picture</li>
                                        </ul>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowDeleteDialog(true)}
                                    variant="destructive"
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete My Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-red-600">
                            <AlertTriangle className="w-6 h-6 mr-2" />
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </p>
                            {(user as any)?.password && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Enter your password to confirm
                                    </label>
                                    <Input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="border-2 border-gray-300"
                                    />
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting || ((user as any)?.password && !deletePassword)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}