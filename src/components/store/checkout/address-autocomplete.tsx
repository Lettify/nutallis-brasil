"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type PlaceResult = {
  address: string;
  location: { lat: number; lng: number };
};

type AddressAutocompleteProps = {
  onPlaceSelected: (place: PlaceResult) => void;
};

const loadGoogleMaps = (apiKey: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as typeof window & { google?: unknown }).google) return resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

export const AddressAutocomplete = ({
  onPlaceSelected,
}: AddressAutocompleteProps) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) return;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!inputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            fields: ["formatted_address", "geometry"],
            componentRestrictions: { country: "br" },
          }
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location || !place.formatted_address) return;
          onPlaceSelected({
            address: place.formatted_address,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          });
        });
      })
      .catch(() => null);
  }, [onPlaceSelected]);

  return (
    <Input
      ref={inputRef}
      placeholder="Digite seu endereco para calcular o frete"
    />
  );
};
