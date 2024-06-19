import { PublicKey } from "@solana/web3.js";
import { CUSTOM_BG_TLD } from "./constants";
import { CustomBg } from "./types/custom-bg";
import { getHashedNameSync, getNameAccountKeySync } from "./utils";
import { ErrorType, SNSError } from "./error";

const DEGEN_POET_KEY = new PublicKey(
  "ART5dr4bDic2sQVZoFheEmUxwQq5VGSx9he7JxHcXNQD",
);
const RBG_0x00_KEY = new PublicKey(
  "CSWvuDHXExVGEMR9kP8xYAHuNjXogeRck9Cnr312CC9g",
);
const RETARDIO_KEY = new PublicKey(
  "J2Q2j6kpSg7tq8JzueCHNTQNcyNnQkvr85RhsFnYZWeG",
);

export const getCustomBgKeys = (domain: string, customBg: CustomBg) => {
  const hashedBg = getHashedNameSync(customBg);
  const hashedDomain = getHashedNameSync(domain);

  const domainKey = getNameAccountKeySync(
    hashedDomain,
    undefined,
    CUSTOM_BG_TLD,
  );
  const bgKey = getNameAccountKeySync(hashedBg, undefined, domainKey);

  return { domainKey, bgKey };
};

export const getArtistPubkey = (bg: CustomBg): PublicKey => {
  switch (bg) {
    case CustomBg.DegenPoet1:
      return DEGEN_POET_KEY;
    case CustomBg.Rgb0x001:
      return RBG_0x00_KEY;
    case CustomBg.Retardio1:
      return RETARDIO_KEY;
    case CustomBg.Retardio2:
      return RETARDIO_KEY;
    case CustomBg.Retardio3:
      return RETARDIO_KEY;
    default:
      throw new SNSError(ErrorType.InvalidCustomBg);
  }
};
