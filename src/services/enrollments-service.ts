import { Address, Enrollment } from "@prisma/client";
import httpStatus from "http-status";
import { request } from "@/utils/request";
import { requestError } from "@/errors";
import {
  addressRepository,
  CreateAddressParams,
  enrollmentRepository,
  CreateEnrollmentParams,
} from "@/repositories";
import { exclude } from "@/utils/prisma-utils";
import { AddressCEP } from "@/protocols";

async function getAddressFromCEP(cep: string): Promise<AddressCEP> {
  const result = await request.get(`${process.env.VIA_CEP_API}/${cep}/json/`);

  if (result.data.erro)
    throw requestError(httpStatus.BAD_REQUEST, "Bad Request");
  const address = {
    logradouro: result.data.logradouro,
    complemento: result.data.complemento,
    bairro: result.data.bairro,
    cidade: result.data.localidade,
    uf: result.data.uf,
  };

  return address;
}

async function getOneWithAddressByUserId(
  userId: number
): Promise<GetOneWithAddressByUserIdResult> {
  const enrollmentWithAddress =
    await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress)
    throw requestError(httpStatus.BAD_REQUEST, "Bad Request");

  const [firstAddress] = enrollmentWithAddress.Address;
  const address = getFirstAddress(firstAddress);

  return {
    ...exclude(
      enrollmentWithAddress,
      "userId",
      "createdAt",
      "updatedAt",
      "Address"
    ),
    ...(!!address && { address }),
  };
}

type GetOneWithAddressByUserIdResult = Omit<
  Enrollment,
  "userId" | "createdAt" | "updatedAt"
>;

function getFirstAddress(firstAddress: Address): GetAddressResult {
  if (!firstAddress) return null;

  return exclude(firstAddress, "createdAt", "updatedAt", "enrollmentId");
}

type GetAddressResult = Omit<
  Address,
  "createdAt" | "updatedAt" | "enrollmentId"
>;

async function createOrUpdateEnrollmentWithAddress(
  params: CreateOrUpdateEnrollmentWithAddress
) {
  const enrollment = exclude(params, "address");
  enrollment.birthday = new Date(enrollment.birthday);
  const address = getAddressForUpsert(params.address);

  await getAddressFromCEP(params.address.cep);

  const newEnrollment = await enrollmentRepository.upsert(
    params.userId,
    enrollment,
    exclude(enrollment, "userId")
  );

  await addressRepository.upsert(newEnrollment.id, address, address);
}

function getAddressForUpsert(address: CreateAddressParams) {
  return {
    ...address,
    ...(address?.addressDetail && { addressDetail: address.addressDetail }),
  };
}

export type CreateOrUpdateEnrollmentWithAddress = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

export const enrollmentsService = {
  getOneWithAddressByUserId,
  createOrUpdateEnrollmentWithAddress,
  getAddressFromCEP,
};
