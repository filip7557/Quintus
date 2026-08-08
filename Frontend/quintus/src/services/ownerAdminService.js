import api from "@/lib/api";

const LIST_OWNERS_ENDPOINT = "/Admin/owners";
const MAKE_OWNER_ENDPOINT_PREFIX = "/Admin/owners"; // /Admin/owners/{id}
const GET_USER_BY_EMAIL_PREFIX = "/User/email"; // /User/email/{email}

export async function getOwners() {
  try {
    const response = await api.get(LIST_OWNERS_ENDPOINT);
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function getUserByEmail(email) {
  try {
    const safeEmail = encodeURIComponent(String(email));
    const response = await api.get(`${GET_USER_BY_EMAIL_PREFIX}/${safeEmail}`);
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function makeOwnerById(userId) {
  try {
    const safeId = encodeURIComponent(String(userId));
    // Backend contract: /Admin/owners/{id} to make someone owner.
    // Use POST with empty body.
    const response = await api.post(`${MAKE_OWNER_ENDPOINT_PREFIX}/${safeId}`, null);
    return response;
  } catch (error) {
    return error.response;
  }
}

export async function addOwnerByEmail(email) {
  const resp = await getUserByEmail(email);
  const ok = resp?.status === 200;
  if (!ok) return resp;

  const user = resp?.data;
  const id = user?.id ?? user?.Id;
  if (!id) return { status: 400, data: { message: "Nedostaje ID korisnika." } };

  return await makeOwnerById(id);
}
