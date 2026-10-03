const pluralRules = new Intl.PluralRules("hr");
const numberFormat = new Intl.NumberFormat("hr-HR");

function formatCount(count, forms) {
  return `${numberFormat.format(count)} ${forms[pluralRules.select(count)] || forms.other}`;
}

export function formatProjectCount(count) {
  return formatCount(count, { one: "projekt", few: "projekta", other: "projekata" });
}

export function formatPhotoCount(count) {
  return formatCount(count, { one: "fotografija", few: "fotografije", other: "fotografija" });
}