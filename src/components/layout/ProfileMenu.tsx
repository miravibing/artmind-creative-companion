import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Pencil, LogOut, X, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null, username: null });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, username")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const displayName = profile.display_name || user?.user_metadata?.display_name || profile.username || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // --- Display Name ---
  const openNameDialog = () => {
    setNewDisplayName(displayName);
    setNameDialogOpen(true);
  };

  const saveDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newDisplayName.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update name.", variant: "destructive" });
    } else {
      setProfile((p) => ({ ...p, display_name: newDisplayName.trim() }));
      toast({ title: "Updated", description: "Display name saved." });
      setNameDialogOpen(false);
    }
  };

  // --- Profile Picture ---
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Too large", description: "Max 2MB allowed.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!user || !selectedFile) return;
    setUploading(true);
    const ext = selectedFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, selectedFile, { upsert: true });

    if (uploadError) {
      setUploading(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setUploading(false);
    if (dbError) {
      toast({ title: "Error", description: "Failed to save avatar.", variant: "destructive" });
    } else {
      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      toast({ title: "Updated", description: "Profile picture saved." });
      setPictureDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const closePictureDialog = () => {
    setPictureDialogOpen(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all duration-300 focus:outline-none">
            <Avatar className="h-9 w-9 cursor-pointer">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-0 rounded-xl shadow-xl border border-border/50 bg-popover">
          {/* Header with avatar + name */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <Avatar className="h-12 w-12">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="p-1">
            <DropdownMenuItem
              className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
              onClick={() => setEditDialogOpen(true)}
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Edit Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
              onClick={() => setPictureDialogOpen(true)}
            >
              <Camera className="w-4 h-4 text-muted-foreground" />
              <span>Change Profile Picture</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
              onClick={openNameDialog}
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              <span>Edit Display Name</span>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <div className="p-1">
            <DropdownMenuItem
              className="gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Dialog (combines both) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => { setEditDialogOpen(false); setPictureDialogOpen(true); }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDisplayName || displayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    disabled={saving || !newDisplayName.trim()}
                    onClick={async () => {
                      if (!user || !newDisplayName.trim()) return;
                      setSaving(true);
                      const { error } = await supabase.from("profiles").update({ display_name: newDisplayName.trim() }).eq("id", user.id);
                      setSaving(false);
                      if (!error) {
                        setProfile((p) => ({ ...p, display_name: newDisplayName.trim() }));
                        toast({ title: "Saved", description: "Display name updated." });
                      }
                    }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted/50" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Picture Dialog */}
      <Dialog open={pictureDialogOpen} onOpenChange={closePictureDialog}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>Upload a new profile picture (max 2MB).</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-28 w-28 border-2 border-border">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelect}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Choose Image
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closePictureDialog}>Cancel</Button>
            <Button onClick={uploadAvatar} disabled={!selectedFile || uploading} className="gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
            <DialogDescription>Choose how your name appears to others.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Display Name</Label>
            <Input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNameDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDisplayName} disabled={saving || !newDisplayName.trim()} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
