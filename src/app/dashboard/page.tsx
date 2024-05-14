"use client";

import { UI } from "@/components/common";

export default function Home() {
  return (
    <UI.Container>
      <p style={{ fontSize: "10rem" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio natus
        impedit perferendis doloribus? Iusto, reprehenderit quisquam at mollitia
        inventore enim, repellat debitis temporibus, facilis maiores delectus
        dignissimos consectetur et minima.
      </p>

      {/* TABLE USAGE */}
      <UI.Table
        actionBar={<></>}
        head={{
          id: "ID/NO",
          customerName: "Customer Name",
          age: "Age",
          actions: (
            <UI.Container>
              <UI.Text>Actions</UI.Text>
            </UI.Container>
          ),
        }}
        data={[
          {
            id: "Some ID",
            customerName: "Okechukwu",
            age: "28",
            actions: <>Some Actions</>,
          },
          {
            id: "Some ID",
            customerName: "Okechukwu",
            age: "28",
            actions: <>Some action</>,
          },
        ]}
      />
    </UI.Container>
  );
}
