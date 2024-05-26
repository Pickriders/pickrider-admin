import * as React from "react";
import { Container } from "../Container";
import { Text } from "../Text";
import style from "./styles.module.scss";
import "@/styles/layout/_grid.scss";

const Table = <T extends { [key: string]: string | React.ReactNode }>(
  props: TableProps<T>
) => {
  return (
    <Container backgroundColor="#ffff" borderRadius={8}>
      {props.actionBar}

      <Container overflowX="auto">
        <table className={style.table}>
          <thead>
            <tr>
              {Object.values(props.head).map((item, i) => (
                <th style={{ border: "none" }} key={`${i}`}>
                  <Text variant="heading">{item as any}</Text>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {props.data.map((row, i) => (
              <tr key={`${i}`}>
                {Object.keys(props.head).map((cell, j) => (
                  <td key={`${i}${j}`}>{row[cell as keyof T] as any}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </Container>
  );
};

export { Table };
