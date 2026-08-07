"use client";

import { useState, useEffect } from "react";
import { inviteMember, cancelInvitation, removeMember, updateMemberRole } from "@/lib/trips";
import { Users, UserPlus, X, Shield, User, Trash2, Mail, Clock, Calendar, ShieldAlert, Sparkles, UserCheck, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

interface Member {
    id: string;
    role: "owner" | "editor" | "viewer";
    joined_at: string;
    profile_id: string;
    profiles: Profile;
}

interface Invitation {
    id: string;
    trip_id: string;
    email: string;
    invited_by: string;
    status: "pending" | "accepted" | "declined" | "expired";
    expires_at: string;
    created_at: string;
    role: "editor" | "viewer";
}

interface TripMembersSectionProps {
    tripId: string;
    isOwner: boolean;
    initialMembers: Member[];
    initialInvitations: Invitation[];
}

export function TripMembersSection({ tripId, isOwner, initialMembers, initialInvitations }: TripMembersSectionProps) {
    const { showToast } = useToast();
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
    
    // Sync state with props when Server Components update in real-time
    useEffect(() => {
        setMembers(initialMembers);
    }, [initialMembers]);

    useEffect(() => {
        setInvitations(initialInvitations);
    }, [initialInvitations]);

    // Modal & Loading States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [inviteLoading, setInviteLoading] = useState(false);
    
    // Dropdown state for role editing
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        const email = inviteEmail.trim().toLowerCase();
        const role = inviteRole;

        if (!email) return;

        // Simple validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("Please enter a valid email address.", "error");
            return;
        }

        setInviteLoading(true);

        // Optimistic UI Update
        const tempId = `optimistic-${Math.random()}`;
        const newInv: Invitation = {
            id: tempId,
            trip_id: tripId,
            email: email,
            invited_by: "",
            status: "pending",
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            role: role
        };

        setInvitations(prev => [newInv, ...prev]);
        setInviteEmail("");
        setIsModalOpen(false);

        try {
            await inviteMember(tripId, email, role);
            showToast(`Invitation sent to ${email} as ${role}.`, "success");
        } catch (err) {
            // Rollback optimistic update
            setInvitations(prev => prev.filter(inv => inv.id !== tempId));
            setInviteEmail(email);
            setIsModalOpen(true);
            showToast(err instanceof Error ? err.message : "Failed to invite user.", "error");
        } finally {
            setInviteLoading(false);
        }
    }

    async function handleRemove(memberId: string, memberName: string) {
        const confirmed = window.confirm(`Are you sure you want to remove ${memberName} from this trip?`);
        if (!confirmed) return;

        setActionLoadingId(memberId);

        // Optimistic UI Update
        const backup = [...members];
        setMembers(prev => prev.filter(m => m.id !== memberId));

        try {
            await removeMember(tripId, memberId);
            showToast(`${memberName} has been removed from the trip.`, "success");
        } catch (err) {
            // Rollback optimistic update
            setMembers(backup);
            showToast(err instanceof Error ? err.message : "Failed to remove member.", "error");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleCancelInvitation(invitationId: string, email: string) {
        const confirmed = window.confirm(`Cancel invitation for ${email}?`);
        if (!confirmed) return;

        setActionLoadingId(invitationId);

        // Optimistic UI Update
        const backup = [...invitations];
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

        try {
            await cancelInvitation(tripId, invitationId);
            showToast(`Invitation for ${email} has been cancelled.`, "success");
        } catch (err) {
            // Rollback optimistic update
            setInvitations(backup);
            showToast(err instanceof Error ? err.message : "Failed to cancel invitation.", "error");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleRoleChange(memberId: string, newRole: "editor" | "viewer") {
        setActionLoadingId(memberId);

        // Optimistic UI Update
        const backup = [...members];
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        setEditingMemberId(null);

        try {
            await updateMemberRole(tripId, memberId, newRole);
            showToast("Role updated successfully.", "success");
        } catch (err) {
            // Rollback optimistic update
            setMembers(backup);
            showToast(err instanceof Error ? err.message : "Failed to update role.", "error");
        } finally {
            setActionLoadingId(null);
        }
    }

    function formatDate(dateStr: string) {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    }

    return (
        <div className="bg-gradient-to-tr from-stone-50 via-white to-amber-50/20 border border-stone-200/80 p-8 rounded-2xl shadow-xl shadow-stone-100/50 space-y-8 relative overflow-hidden">
            {/* Soft decorative light reflection */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-stone-100 pb-5">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-stone-800 flex items-center gap-2.5">
                        <Users className="h-5 w-5 text-amber-600/85" />
                        Workspace Members
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">Collaborate on this trip's schedule & costs</p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4.5 py-2.5 bg-stone-900 text-stone-50 hover:bg-stone-800 active:bg-stone-950 rounded-xl shadow-md shadow-stone-900/10 hover:shadow-stone-900/15 transition-all duration-200"
                    >
                        <UserPlus className="h-3.5 w-3.5 text-amber-400" />
                        Invite Member
                    </button>
                )}
            </div>

            {/* Members Section */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400/90">Active Team</h3>
                <div className="space-y-3.5">
                    {members.map((member) => {
                        const profile = member.profiles || { name: "Unknown Member", email: "No Email" };
                        const isMemberOwner = member.role === "owner";
                        const isLoading = actionLoadingId === member.id;

                        return (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4.5 rounded-2xl border border-stone-100 bg-white shadow-sm hover:shadow-md hover:border-stone-200/60 transition-all duration-200 group gap-4"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.name}
                                            className="h-11 w-11 rounded-full object-cover border-2 border-stone-100/50 shadow-inner flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="h-11 w-11 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/10 text-amber-700 font-bold text-sm flex-shrink-0">
                                            <User className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-stone-800 text-sm truncate">
                                                {profile.name}
                                            </span>
                                            {member.role === "owner" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-550/10 text-amber-700 border border-amber-600/10 px-2.5 py-0.5 text-[10px] font-bold shadow-sm flex-shrink-0">
                                                    <Shield className="h-3 w-3 text-amber-600" />
                                                    Owner
                                                </span>
                                            )}
                                            {member.role === "editor" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-bold shadow-sm flex-shrink-0">
                                                    Editor
                                                </span>
                                            )}
                                            {member.role === "viewer" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60 px-2.5 py-0.5 text-[10px] font-bold shadow-sm flex-shrink-0">
                                                    Viewer
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4 gap-y-0.5 text-xs text-stone-500 font-medium">
                                            <span className="truncate" title={profile.email}>{profile.email}</span>
                                            <span className="hidden sm:inline text-stone-300 flex-shrink-0">•</span>
                                            <span className="flex items-center gap-1 flex-shrink-0">
                                                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                                                Joined {formatDate(member.joined_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls: Only owner can modify others */}
                                {isOwner && !isMemberOwner && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Role Editor */}
                                        {editingMemberId === member.id ? (
                                            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-250 p-1 rounded-xl">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                                                    disabled={isLoading}
                                                    className="bg-transparent text-xs font-semibold text-stone-700 border-none outline-none pr-1 pl-1 cursor-pointer disabled:opacity-50"
                                                >
                                                    <option value="editor">Editor</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                                <button
                                                    onClick={() => setEditingMemberId(null)}
                                                    className="p-1 text-stone-400 hover:text-stone-600 transition"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingMemberId(member.id)}
                                                disabled={isLoading}
                                                className="text-xs font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/70 border border-stone-200 px-3 py-1.5 rounded-xl transition duration-150"
                                            >
                                                Change Role
                                            </button>
                                        )}

                                        {/* Remove member button */}
                                        <button
                                            onClick={() => handleRemove(member.id, profile.name)}
                                            disabled={isLoading}
                                            className="p-2 rounded-xl border border-stone-100 text-stone-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition duration-150 disabled:opacity-50"
                                            title="Remove member"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {members.length === 1 && invitations.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                            <div className="rounded-full bg-amber-500/10 p-3 mb-3 text-amber-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-bold text-stone-800 mb-1">No collaborators yet</h4>
                            <p className="text-xs text-stone-500 max-w-xs mb-4">
                                Invite your friends to start planning this trip together.
                            </p>
                            {isOwner && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 rounded-xl transition shadow-sm"
                                >
                                    <UserPlus className="h-3.5 w-3.5 text-amber-500" />
                                    Invite Friends
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400/90 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Pending Invites
                    </h3>
                    <div className="space-y-3">
                        {invitations.map((inv) => {
                            const isLoading = actionLoadingId === inv.id;
                            return (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between p-4.5 rounded-2xl border border-stone-100 bg-stone-50/50 shadow-sm gap-4"
                                >
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-semibold text-stone-700 text-sm truncate" title={inv.email}>
                                                {inv.email}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 text-stone-600 border border-stone-300/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex-shrink-0">
                                                Pending
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 text-[10px] font-bold flex-shrink-0">
                                                Role: {inv.role}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            Invited on {formatDate(inv.created_at)}
                                        </p>
                                    </div>

                                    {isOwner && (
                                        <button
                                            onClick={() => handleCancelInvitation(inv.id, inv.email)}
                                            disabled={isLoading}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-100 px-3.5 py-1.5 rounded-xl transition duration-150 disabled:opacity-50 flex-shrink-0"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <X className="h-3.5 w-3.5" />
                                            )}
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-stone-200 w-full max-w-md rounded-2xl shadow-2xl p-7 relative z-10 space-y-6"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-stone-850 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    Invite Collaborator
                                </h3>
                                <p className="text-xs text-stone-500 font-medium">Add someone to work on this trip with you</p>
                            </div>

                            <form onSubmit={handleInvite} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="collaborator@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full rounded-xl border border-stone-250 bg-stone-50/50 px-4.5 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-550/20 focus:border-amber-600 focus:bg-white transition-all duration-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Workspace Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setInviteRole("editor")}
                                            className={`p-3.5 border rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-200 ${
                                                inviteRole === "editor"
                                                    ? "bg-amber-50/50 border-amber-500/80 ring-2 ring-amber-500/10"
                                                    : "bg-stone-50/50 border-stone-200 hover:bg-stone-50"
                                            }`}
                                        >
                                            <span className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                                                Editor
                                                {inviteRole === "editor" && <Check className="h-3.5 w-3.5 text-amber-600" />}
                                            </span>
                                            <span className="text-[10px] text-stone-500 font-medium">Can add, edit and delete items</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setInviteRole("viewer")}
                                            className={`p-3.5 border rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-200 ${
                                                inviteRole === "viewer"
                                                    ? "bg-amber-50/50 border-amber-500/80 ring-2 ring-amber-500/10"
                                                    : "bg-stone-50/50 border-stone-200 hover:bg-stone-50"
                                            }`}
                                        >
                                            <span className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                                                Viewer
                                                {inviteRole === "viewer" && <Check className="h-3.5 w-3.5 text-amber-600" />}
                                            </span>
                                            <span className="text-[10px] text-stone-500 font-medium">Can view details & itinerary only</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-1/2 text-xs font-bold text-stone-500 hover:text-stone-800 border border-stone-200 py-3 rounded-xl transition duration-150"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={inviteLoading}
                                        className="w-1/2 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-stone-900 text-stone-50 hover:bg-stone-800 py-3 rounded-xl shadow-md transition duration-200 disabled:opacity-50"
                                    >
                                        {inviteLoading ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Invitation"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
