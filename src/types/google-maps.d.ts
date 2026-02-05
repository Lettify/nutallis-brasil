declare global {
  const google: {
    maps: {
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          options: {
            fields: string[];
            componentRestrictions?: { country: string };
          }
        ) => {
          getPlace: () => {
            formatted_address?: string;
            geometry?: { location?: { lat: () => number; lng: () => number } };
          };
          addListener: (event: string, handler: () => void) => void;
        };
      };
    };
  };
}

export {};
