import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

export function useBoards() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useQuery({
    queryKey: ['boards', currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) return [];

      const objects = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${import.meta.env.VITE_TOAD_PACKAGE_ID}::kanban::Board`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      return objects.data || [];
    },
    enabled: !!currentAccount?.address,
  });
}

export function useBoardOwnerCaps() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useQuery({
    queryKey: ['board-caps', currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) return [];

      const objects = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${import.meta.env.VITE_TOAD_PACKAGE_ID}::kanban::BoardOwnerCap`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      return objects.data || [];
    },
    enabled: !!currentAccount?.address,
  });
}

export function useBoard(boardId?: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      if (!boardId) return null;

      const object = await client.getObject({
        id: boardId,
        options: {
          showContent: true,
          showType: true,
          showOwner: true,
        },
      });

      return object;
    },
    enabled: !!boardId,
  });
}

export function useTasks(boardId?: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['tasks', boardId],
    queryFn: async () => {
      if (!boardId) return [];

      return [];
    },
    enabled: !!boardId,
  });
}
