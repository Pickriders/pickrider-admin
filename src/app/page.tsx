"use client";

const mode: ItemProps[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function Home() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "1rem",
      }}
    ></main>
  );
}
