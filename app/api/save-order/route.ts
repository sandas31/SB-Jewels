import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const sheetBestUrl = 'https://api.sheetbest.com/sheets/773369dd-6f29-4315-a266-60d6a67caf67/tabs/Orders';

    const response = await fetch(sheetBestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SheetBest error response:", errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API route exception:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}