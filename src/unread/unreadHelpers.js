/* @flow */
import { addItemsToArray, removeItemsFromArray } from '../utils/immutability';

export const removeItemsDeeply = (objArray: Object[], messageIds: number[]): Object[] => {
  let changed = false;
  const objWithAddedUnreadIds = objArray.map(obj => {
    const newIds = removeItemsFromArray(obj.unread_message_ids, messageIds);
    if (newIds.length === obj.unread_message_ids) {
      return obj;
    }

    const filteredIds = removeItemsFromArray(obj.unread_message_ids, messageIds);

    if (filteredIds.length === obj.unread_message_ids.length) {
      return obj;
    }

    changed = true;

    return {
      ...obj,
      unread_message_ids: filteredIds,
    };
  });

  if (!changed) {
    return objArray;
  }

  const filteredEmptyIds = objWithAddedUnreadIds.filter(
    sender => sender.unread_message_ids.length > 0,
  );

  return objWithAddedUnreadIds.length === filteredEmptyIds.length
    ? objWithAddedUnreadIds
    : filteredEmptyIds;
};

const addItemsDeeply = (input: Object[], itemsToAdd: Object[], index: number): Object[] => {
  const item = input[index];

  const unreadMessageIds = addItemsToArray(item.unread_message_ids, itemsToAdd);

  if (item.unread_message_ids === unreadMessageIds) {
    return input;
  }

  return [
    ...input.slice(0, index),
    {
      ...item,
      unread_message_ids: addItemsToArray(item.unread_message_ids, itemsToAdd),
    },
    ...input.slice(index + 1),
  ];
};

export const addItemsToPmArray = (
  input: Object[],
  itemsToAdd: Object[],
  senderId: number,
): Object[] => {
  const index = input.findIndex(sender => sender.sender_id === senderId);

  if (index !== -1) {
    return addItemsDeeply(input, itemsToAdd, index);
  }

  return [
    ...input,
    {
      sender_id: senderId,
      unread_message_ids: itemsToAdd,
    },
  ];
};

export const addItemsToHuddleArray = (
  input: Object[],
  itemsToAdd: Object[],
  userIds: string,
): Object[] => {
  const index = input.findIndex(recipients => recipients.user_ids_string === userIds);

  if (index !== -1) {
    return addItemsDeeply(input, itemsToAdd, index);
  }

  return [
    ...input,
    {
      user_ids_string: userIds,
      unread_message_ids: itemsToAdd,
    },
  ];
};

export const addItemsToStreamArray = (
  input: Object[],
  itemsToAdd: Object[],
  streamId: string,
  topic: string,
): Object[] => {
  const index = input.findIndex(s => s.stream_id === streamId && s.topic === topic);

  if (index !== -1) {
    return addItemsDeeply(input, itemsToAdd, index);
  }
  return [
    ...input,
    {
      stream_id: streamId,
      topic,
      unread_message_ids: itemsToAdd,
    },
  ];
};
