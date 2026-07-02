"use client";

import { createContext, useContext } from "react";
import { repositories, type Repositories } from "@/lib/repositories";

const RepositoryContext = createContext<Repositories>(repositories);

export function RepositoryProvider({
  children,
  value = repositories,
}: {
  children: React.ReactNode;
  value?: Repositories;
}) {
  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): Repositories {
  return useContext(RepositoryContext);
}
