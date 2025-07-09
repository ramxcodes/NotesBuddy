"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  GearSixIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  TextAaIcon,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

const FONT_OPTIONS = [
  { name: "Excon", class: "font-excon", label: "Excon" },
  { name: "Ranade", class: "font-ranade", label: "Ranade" },
  { name: "Satoshi", class: "font-satoshi", label: "Satoshi" },
  { name: "Poppins", class: "font-poppins", label: "Poppins" },
  { name: "Lexend", class: "font-lexend", label: "Lexend" },
  { name: "Montserrat", class: "font-montserrat", label: "Montserrat" },
  { name: "Roboto", class: "font-roboto", label: "Roboto" },
  { name: "Inter", class: "font-inter", label: "Inter" },
];

const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  "extra-large": 20,
  huge: 22,
  "this-is-madness": 24,
};

export default function NotesFontControl() {
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [fontSize, setFontSize] = useState("medium");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedFont = localStorage.getItem("notes-font-family");
    const savedSize = localStorage.getItem("notes-font-size");

    if (savedFont) {
      const font = FONT_OPTIONS.find((f) => f.name === savedFont);
      if (font) setSelectedFont(font);
    }

    if (savedSize && Object.keys(FONT_SIZES).includes(savedSize)) {
      setFontSize(savedSize);
    }
  }, []);

  // Apply font changes to the article element
  useEffect(() => {
    const articleElement = document.querySelector("article");
    if (articleElement) {
      // Remove all font classes
      FONT_OPTIONS.forEach((font) => {
        articleElement.classList.remove(font.class);
      });

      // Add selected font class
      articleElement.classList.add(selectedFont.class);

      // Set font size
      articleElement.style.fontSize = `${FONT_SIZES[fontSize as keyof typeof FONT_SIZES]}px`;
    }
  }, [selectedFont, fontSize]);

  const handleFontChange = (font: (typeof FONT_OPTIONS)[0]) => {
    setSelectedFont(font);
    localStorage.setItem("notes-font-family", font.name);
  };

  const increaseFontSize = () => {
    const sizes = Object.keys(FONT_SIZES);
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      const newSize = sizes[currentIndex + 1];
      setFontSize(newSize);
      localStorage.setItem("notes-font-size", newSize);
    }
  };

  const decreaseFontSize = () => {
    const sizes = Object.keys(FONT_SIZES);
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      const newSize = sizes[currentIndex - 1];
      setFontSize(newSize);
      localStorage.setItem("notes-font-size", newSize);
    }
  };

  // Get the first and last font size keys for comparison
  const fontSizeKeys = Object.keys(FONT_SIZES);
  const minFontSize = fontSizeKeys[0];
  const maxFontSize = fontSizeKeys[fontSizeKeys.length - 1];

  // Font control content component
  const FontControlContent = () => (
    <div className="flex flex-col gap-4">
      {/* Font Family Section */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Font Family</h3>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <Button
              key={font.name}
              variant={selectedFont.name === font.name ? "default" : "outline"}
              onClick={() => handleFontChange(font)}
              className={`${font.class} h-12`}
            >
              {font.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Size Section */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Font Size</h3>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={decreaseFontSize}
            disabled={fontSize === minFontSize}
            title="Decrease font size"
          >
            <MinusCircleIcon size={20} weight="duotone" />
          </Button>

          <div className="min-w-[80px] text-center">
            <span className="text-xl font-semibold">
              {FONT_SIZES[fontSize as keyof typeof FONT_SIZES]}px
            </span>
            <p className="text-muted-foreground text-sm capitalize">
              {fontSize.replace("-", " ")}
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={increaseFontSize}
            disabled={fontSize === maxFontSize}
            title="Increase font size"
          >
            <PlusCircleIcon size={20} weight="duotone" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop  */}
      <div className="fixed top-1/2 left-4 z-50 hidden -translate-y-1/2 lg:block">
        <div className="flex flex-col gap-2 rounded-lg border p-2 backdrop-blur-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <TextAaIcon size={16} weight="duotone" />
                <span className="ml-1 text-xs">{selectedFont.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {FONT_OPTIONS.map((font) => (
                <DropdownMenuItem
                  key={font.name}
                  onClick={() => handleFontChange(font)}
                  className={`${font.class} ${
                    selectedFont.name === font.name ? "bg-accent" : ""
                  }`}
                >
                  {font.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator />

          {/* Font Size Controls */}
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={fontSize === maxFontSize}
              className="w-full"
              title="Increase font size"
            >
              <PlusCircleIcon size={16} weight="duotone" />
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground text-xs">
                {FONT_SIZES[fontSize as keyof typeof FONT_SIZES]}px
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize === minFontSize}
              className="w-full"
              title="Decrease font size"
            >
              <MinusCircleIcon size={16} weight="duotone" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="fixed bottom-4 left-4 z-50 lg:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="bg-background/95 rounded-full backdrop-blur-sm"
            >
              <GearSixIcon size={24} weight="duotone" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <DrawerTitle>Reading Preferences</DrawerTitle>
              <DrawerDescription>
                Customize your reading experience with different fonts and sizes
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-8">
              <FontControlContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
