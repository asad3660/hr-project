"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import type { ResumeDetail } from "@/types/resume";

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === "admin" || user?.role === "hr";

  const fetchResume = useCallback(async () => {
    try {
      const data = await api.get<ResumeDetail>(
        `/resumes/${params.id}/`,
        token
      );
      setResume(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load resume"
      );
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleDelete = async () => {
    if (!resume || !confirm(`Delete resume for ${resume.candidate_name}?`))
      return;

    try {
      await api.delete(`/resumes/${resume._id}/delete/`, token);
      toast.success("Resume deleted");
      router.push("/resumes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading resume...</p>;
  }

  if (!resume) {
    return <p className="text-muted-foreground">Resume not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/resumes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {resume.candidate_name}
          </h1>
          <p className="text-muted-foreground">
            {resume.file_type.toUpperCase()} &middot; Uploaded by{" "}
            {resume.uploaded_by} &middot;{" "}
            {new Date(resume.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={resume.file_url}
            target="_blank"
            rel="noopener noreferrer"
            title="View original file"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Original File
            </Button>
          </a>
          {canManage && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Extracted Chunks ({resume.chunks.length})
        </h2>
        <div className="space-y-4">
          {resume.chunks.map((chunk) => (
            <Card key={chunk._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Chunk {chunk.chunk_index + 1}
                </CardTitle>
                <CardDescription className="text-xs">
                  ~{chunk.text.split(" ").length} words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{chunk.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
