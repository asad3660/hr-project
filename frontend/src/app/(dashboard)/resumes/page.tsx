"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { UploadForm } from "@/components/resumes/upload-form";
import { toast } from "sonner";
import { FileText, Trash2, ExternalLink } from "lucide-react";
import type { Resume } from "@/types/resume";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { user, token } = useAuth();

  const canManage = user?.role === "admin" || user?.role === "hr";

  const fetchResumes = useCallback(async () => {
    try {
      const data = await api.get<Resume[]>("/resumes/", token);
      setResumes(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete resume for ${name}?`)) return;

    try {
      await api.delete(`/resumes/${id}/delete/`, token);
      toast.success("Resume deleted");
      fetchResumes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? "Hide Upload" : "Upload Resume"}
          </Button>
        )}
      </div>

      {showUpload && canManage && (
        <UploadForm
          onSuccess={() => {
            fetchResumes();
            setShowUpload(false);
          }}
        />
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resumes uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {resume.candidate_name}
                    </CardTitle>
                    <CardDescription>
                      {resume.file_type.toUpperCase()} &middot; Uploaded by{" "}
                      {resume.uploaded_by}
                    </CardDescription>
                  </div>
                  <span className="rounded bg-muted px-2 py-1 text-xs font-medium uppercase">
                    {resume.file_type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  {new Date(resume.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link href={`/resumes/${resume._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <a
                    href={resume.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download original file"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                  {canManage && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDelete(resume._id, resume.candidate_name)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
