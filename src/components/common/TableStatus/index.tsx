import { SVG } from "@/components/svg";
import { Container } from "../Container";
import { Text } from "../Text";
import { StatusProps } from "./Status.type";

export const TableStatus = ({ status }: StatusProps) => {
  return (
    <>
      {status === "active" && (
        <Container display="flex" alignItems="center" columnGap={10}>
          <SVG.StatusIcon color="#3E7DF6" />
          <Text color="#3E7DF6">Active</Text>
        </Container>
      )}
      {status === "declined" && (
        <Container display="flex" alignItems="center" columnGap={10}>
          <SVG.StatusIcon color="#FF5244" />
          <Text color="#FF5244">Declined</Text>
        </Container>
      )}

      {status === "pending" && (
        <Container display="flex" alignItems="center" columnGap={10}>
          <SVG.StatusIcon color="#F6963E" />
          <Text color="#F6963E">Pending</Text>
        </Container>
      )}
      {status === "verified" && (
        <Container display="flex" alignItems="center" columnGap={10}>
          <SVG.StatusIcon color="#32BA7C" />
          <Text color="#32BA7C">Verified</Text>
        </Container>
      )}
    </>
  );
};
