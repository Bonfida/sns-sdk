import { getDomainAddress } from "../domain/getDomainAddress";
import { getReverseAddressFromDomainAddress } from "./getReverseAddressFromDomainAddress";

export const getReverseAddress = async (domain: string) => {
  const { address, parentAddress } = await getDomainAddress(domain);

  return getReverseAddressFromDomainAddress(address, parentAddress);
};
