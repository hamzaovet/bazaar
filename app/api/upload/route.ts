import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرسال أي صورة" }, { status: 400 });
    }

    const apiKey =
      process.env.IMGBB_API_KEY ||
      process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
      "1705736b8f2b46dcbaeec8a6025aca83";

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", base64Data);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbFormData,
    });

    const data = await res.json();

    if (data.success && data.data?.url) {
      return NextResponse.json({
        success: true,
        url: data.data.url,
        thumbUrl: data.data.thumb?.url || data.data.url,
        deleteUrl: data.data.delete_url,
      });
    }

    return NextResponse.json(
      { error: "فشل رفع الصورة على ImgBB", details: data },
      { status: 502 }
    );
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة رفع الصورة" },
      { status: 500 }
    );
  }
}
