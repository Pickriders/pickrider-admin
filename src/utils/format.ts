import "intl";
import "intl/locale-data/jsonp/en";

export const toTitleCase = (text: string) => {
  return text?.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
interface Option {
  hideAmount?: boolean;
  isCurrency?: boolean;
  currency?: string;
  symbolOnly?: boolean;
}

export const formatMoney = (amount: number | string, option?: Option) => {
  const { hideAmount = false, isCurrency = true, currency = "NGN" } = option ?? {};

  const formatType = new Intl.NumberFormat("en-US", {
    style: isCurrency ? "currency" : undefined,
    currency: isCurrency ? currency : undefined,
    maximumSignificantDigits: 12,
  });

  let money = formatType.format(isNaN(Number(amount)) ? 0 : Number(amount));

  // Replace NGN with ₦ and non-breaking space with space
  money = money.replace("NGN", "\u20A6").replace(/\u00A0/g, " ");

  if (hideAmount) {
    money = money.replaceAll(/[\d,\.]+/g, "*").padEnd(12, "*");
  }
  if (option?.symbolOnly) {
    money = money.replaceAll(/[\d,\.]+/g, "");
  }

  return money;
};
