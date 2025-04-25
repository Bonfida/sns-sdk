import { getDomainAddress } from "../domain/getDomainAddress";
import { getReverseAddressFromDomainAddress } from "./getReverseAddressFromDomainAddress";

export const getReverseAddress = async (domain: string) => {
  const { domainAddress, parentAddress } = await getDomainAddress({ domain });

  return getReverseAddressFromDomainAddress({
    domainAddress,
    parentAddress,
  });
};
