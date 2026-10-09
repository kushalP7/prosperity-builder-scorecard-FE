export interface CreateInquiryPayload {
  firstName: string;
  lastName: string;
  organizationName: string;
  jobTitle: string;
  businessEmail: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
  organizationType: string;
  notes?: string;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  id?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function submitInquiry(payload: CreateInquiryPayload): Promise<InquiryResponse> {
  const res = await fetch(`${API_BASE_URL}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || 'Failed to submit inquiry. Please try again.';
    throw new Error(message);
  }

  return res.json();
}
