import * as React from "react";
import { Container } from "../Container";

const Table = <T extends {}>(props: TableProps<T>) => {
  return (
    <Container>
      <table className="table">
        <Container>
          <thead>
            <tr>
              {Object.values(props.head).map((item, i) => (
                <th key={`${i}`}>{item as any}</th>
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
        </Container>
      </table>
    </Container>
  );
};

export { Table };
