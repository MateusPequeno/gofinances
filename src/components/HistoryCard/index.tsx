import React from "react";
import { Amount, Container, Title, Icon } from "./styles";
import { Feather } from "@expo/vector-icons";

interface Props<T = string> {
  color: T;
  title: T;
  amount: T;
  iconName: T;
  iconColor: T;
}

export function HistoryCard({
  color,
  title,
  amount,
  iconName,
  iconColor,
}: Props): JSX.Element {
  return (
    <Container color={color}>
      <Icon name={iconName} style={{ color: iconColor }} />
      <Title>{title}</Title>
      <Amount>{amount}</Amount>
    </Container>
  );
}
