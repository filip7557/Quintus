import api from "@/lib/api";

async function patchField(fieldPath, value) {
  try {
    // The API uses field-specific endpoints (e.g. PATCH /api/SiteSettings/title).
    // Send the raw value as JSON (e.g. "New title").
    // Axios will send plain strings as text/plain by default, which some ASP.NET
    // endpoints reject with 415. Force JSON for primitives by stringifying.
    const jsonBody = JSON.stringify(value ?? "");
    const response = await api.patch(`/SiteSettings/${fieldPath}`, jsonBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
}

async function patchFormDataToFirstWorkingRoute(routeCandidates, formData) {
  const candidates = Array.isArray(routeCandidates)
    ? routeCandidates.filter(Boolean)
    : [];

  let lastResponse;
  for (const route of candidates) {
    try {
      const response = await api.patch(`/SiteSettings/${route}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      const resp = error?.response;
      lastResponse = resp;
      // If the backend changed the route name, try the next candidate.
      if (resp?.status === 404) continue;
      return resp;
    }
  }

  return lastResponse;
}

async function patchSingleImage(routeCandidates, file, extraFieldNames = []) {
  try {
    if (!file) throw new Error("Nedostaje datoteka");
    const formData = new FormData();
    // Be forgiving about .NET parameter names.
    const fieldNames = [
      "file",
      "File",
      "image",
      "Image",
      ...(Array.isArray(extraFieldNames) ? extraFieldNames : []),
    ];

    [...new Set(fieldNames.filter(Boolean))].forEach((name) => {
      formData.append(name, file);
    });
    return await patchFormDataToFirstWorkingRoute(routeCandidates, formData);
  } catch (error) {
    return error?.response;
  }
}

export const patchHeroBackgroundImageUrl = (value) =>
  patchField("heroBackgroundImageUrl", value);

export const patchHeroBackgroundImageMobileUrl = (value) =>
  patchField("heroBackgroundImageMobileUrl", value);

// Image uploads (IFormFile)
export const patchHeroBackgroundImage = (file) =>
  patchSingleImage(
    ["heroBackgroundImage", "heroBackgroundImageUrl"],
    file,
    ["heroBackgroundImage", "HeroBackgroundImage", "heroBackgroundImageFile", "HeroBackgroundImageFile"]
  );

export const patchHeroBackgroundImageMobile = (file) =>
  patchSingleImage(
    ["heroBackgroundImageMobile", "heroBackgroundImageMobileUrl"],
    file,
    ["heroBackgroundImageMobile", "HeroBackgroundImageMobile", "heroBackgroundImageMobileFile", "HeroBackgroundImageMobileFile"]
  );

export const patchTitle = (value) => patchField("title", value);

export const patchDescription = (value) => patchField("description", value);

export const patchAboutUs = (value) => patchField("aboutUs", value);

export const patchAboutUsImageUrl = (value) => patchField("aboutUsImageUrl", value);

export const patchAboutUsImage = (file) =>
  patchSingleImage(
    ["aboutUsImage", "aboutUsImageUrl"],
    file,
    ["aboutUsImage", "AboutUsImage", "aboutUsImageFile", "AboutUsImageFile"]
  );

export const patchAddress = (value) => patchField("address", value);

export const patchPhoneNumber = (value) => patchField("phoneNumber", value);

export const patchContactEmail = (value) => patchField("contactEmail", value);

export const patchOib = (value) => patchField("oib", value);

export const patchBrojObrtnice = (value) => patchField("brojObrtnice", value);

export const patchIban = (value) => patchField("iban", value);
