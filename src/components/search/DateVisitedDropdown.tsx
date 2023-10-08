import React from "react";
import * as Ariakit from "@ariakit/react"

export const DateVisitedDropdown: React.FC<{}> = ({ }) => {
  return <Ariakit.PopoverProvider>
    <Ariakit.PopoverDisclosure className="button">
      Accept invite
    </Ariakit.PopoverDisclosure>
    <Ariakit.Popover className="">
      <Ariakit.PopoverArrow className="arrow" />
      <Ariakit.PopoverHeading className="heading">
        Team meeting
      </Ariakit.PopoverHeading>
      <Ariakit.PopoverDescription>
        We are going to discuss what we have achieved on the project.
      </Ariakit.PopoverDescription>
      <div>
        <p>12 Jan 2022 18:00 to 19:00</p>
        <p>Alert 10 minutes before start</p>
      </div>
      <Ariakit.Button className="button">Accept</Ariakit.Button>
    </Ariakit.Popover>
  </Ariakit.PopoverProvider>
}