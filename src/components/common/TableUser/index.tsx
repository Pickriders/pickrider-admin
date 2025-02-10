import Image from "next/image";
import { Container } from "../Container";
import { TableUserProps } from "./TableUser.type";
import { Text } from "../Text";

export const TableUser = ({ userName, userEmail, userImg }: TableUserProps) => {
  return (
    <Container display="flex" alignItems="center" columnGap={8}>
      <Container
        width={"2.2rem"}
        height={"2.2rem"}
        backgroundColor="#D9D9D9"
        borderRadius={9999}
        flexShrink={0}
      >
        {userImg && <Image src={userImg} alt={`${userName}`} />}
      </Container>
      <Container>
        <Text fontWeight={userEmail ? 700 : ""}>{userName}</Text>
        {userEmail && <Text>{userEmail}</Text>}
      </Container>
    </Container>
  );
};
