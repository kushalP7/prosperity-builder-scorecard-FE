"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MediaForm } from "@/components/cms/MediaForm";

export default function EditMediaPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return <MediaForm mediaId={id} />;
}
