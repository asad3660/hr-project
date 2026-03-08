export interface Resume {
  _id: string;
  candidate_name: string;
  file_url: string;
  file_type: "pdf" | "docx";
  uploaded_by: string;
  created_at: string;
}

export interface ResumeChunk {
  _id: string;
  document_id: string;
  chunk_index: number;
  text: string;
  candidate_name: string;
}

export interface ResumeDetail extends Resume {
  raw_text: string;
  cloudinary_public_id: string;
  chunks: ResumeChunk[];
}

export interface UploadResponse {
  id: string;
  candidate_name: string;
  file_url: string;
  file_type: string;
  chunks_count: number;
}
