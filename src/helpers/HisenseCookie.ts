export async function validateHisenseCookie(cookie: string): Promise<string | null> {
  try {
    const response = await fetch("api/validate-cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookie }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.valid && data.name) {
      return data.name;
    }

    return null;
  } catch (error) {
    console.error("Error validating Hisense cookie:", error);
    return null;
  }
}
