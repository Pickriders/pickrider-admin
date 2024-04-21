import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes before refetch
    },
  },
});
{
  /* 
      
      components/
      common/button./button.type.ts/index.tsx/style.module
            index.ts 

            
            // feat/design-button
// fix/cancel-button
// hotfix/update-button

      
      */
}
