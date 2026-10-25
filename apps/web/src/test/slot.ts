export const querySlot = (name: string) =>
  document.querySelector<HTMLElement>(`[data-slot="${name}"]`);

export const getSlot = (name: string) => {
  const element = querySlot(name);
  if (!element) {
    throw new Error(`No element with data-slot="${name}"`);
  }
  return element;
};
