// utils/parseUserAgent.js
export const parseUserAgent = (uaString) => {
  if (!uaString) return "-";

  let os = "Unknown OS";
  let browser = "Unknown Browser";

  // Xác định OS
  if (uaString.includes("Windows NT 10.0")) os = "Windows 10";
  else if (uaString.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (uaString.includes("Windows NT 6.2")) os = "Windows 8";
  else if (uaString.includes("Windows NT 6.1")) os = "Windows 7";
  else if (uaString.includes("Mac OS X")) os = "Mac OS X";
  else if (uaString.includes("Linux")) os = "Linux";

  // Xác định Browser
  if (uaString.includes("Edg/")) browser = "Edge";
  else if (uaString.includes("Chrome/")) browser = "Chrome";
  else if (uaString.includes("Firefox/")) browser = "Firefox";
  else if (uaString.includes("Safari/") && !uaString.includes("Chrome")) browser = "Safari";

  return `${os} - ${browser}`;
};
