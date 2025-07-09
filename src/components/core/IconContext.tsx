import { IconContext } from "@phosphor-icons/react";

export const IconContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IconContext.Provider
      value={{
        size: 20,
        weight: "duotone",
        mirrored: false,
        color: "currentColor",
      }}
    >
      {children}
    </IconContext.Provider>
  );
};
