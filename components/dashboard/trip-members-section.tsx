"use client";

import { useState } from "react";
import { addMember, removeMember } from "@/lib/trips";
import { Users, UserPlus, X, Shield, User } from "lucide-react";

interface Profile {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

interface Member {
    id: string;
    role: "owner" | "member";
    joined_at: string;
    profile_id: string;
    profiles: Profile;
}

interface TripMembersSectionProps {
    tripId: string;
    isOwner: boolean;
    initialMembers: Member[];
}

export function TripMembersSection({ tripId, isOwner, initialMembers }: TripMembersSectionProps) {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await addMember(tripId, inviteEmail.trim());
            
            // Note: Since Server Action revalidates, we can refresh the page or manually update the UI list.
            // For immediate feedback in our client state, we alert the user or ask them to reload, or let Next.js refresh.
            // A simple page reload or window.location.reload() will retrieve the updated server-side props.
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to invite user.");
            setLoading(false);
        }
    }

    async function handleRemove(memberId: string, memberName: string) {
        const confirmed = window.confirm(`Are you sure you want to remove ${memberName} from this trip?`);
        if (!confirmed) return;

        setLoading(true);

        try {
            await removeMember(tripId, memberId);
            window.location.reload();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to remove member.");
            setLoading(false);
        }
    }

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary/70" />
                    Trip Members
                </h2>
                {isOwner && (
                    <button
                        onClick={() => setIsInviting(!isInviting)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-border rounded-lg bg-card hover:bg-muted/40 transition text-foreground"
                    >
                        <UserPlus className="h-3.5 w-3.5 text-primary" />
                        {isInviting ? "Cancel" : "Invite"}
                    </button>
                )}
            </div>

            {/* Invite Form */}
            {isInviting && (
                <form onSubmit={handleInvite} className="p-4 border border-primary/20 rounded-lg bg-primary/5 space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Invite a Friend by Email</h3>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            required
                            placeholder="friend@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/95 disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add"}
                        </button>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                </form>
            )}

            {/* Members List */}
            <div className="space-y-3">
                {members.map((member) => {
                    const profile = member.profiles || { name: "Unknown", email: "No Email" };
                    const isMemberOwner = member.role === "owner";

                    return (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10"
                        >
                            <div className="flex items-center gap-3">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.name}
                                        className="h-9 w-9 rounded-full object-cover border border-border"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-border text-primary font-bold text-sm">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-foreground text-sm">
                                            {profile.name}
                                        </span>
                                        {isMemberOwner ? (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-[10px] font-semibold border border-amber-500/20">
                                                <Shield className="h-2.5 w-2.5" />
                                                Owner
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[10px] font-semibold border border-blue-500/20">
                                                Member
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>

                            {/* Remove button (Only owner can remove others, owner cannot remove themselves) */}
                            {isOwner && !isMemberOwner && (
                                <button
                                    onClick={() => handleRemove(member.id, profile.name)}
                                    disabled={loading}
                                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
