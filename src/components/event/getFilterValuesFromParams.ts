import { SearchEventValues } from "@/types/eventTypes";
import { DateTime } from "luxon";
import { chronologicalOrder, reverseChronologicalOrder } from "./filterStrings";
import LocationFilterTypes from "./locationFilterTypes";
import {
  createDefaultSelectedWeeklyHourRanges,
  createDefaultSelectedHourRanges,
  createDefaultSelectedWeekdays,
} from "./eventSearchOptions";

import { resultOrderTypes } from "./eventSearchOptions";

const defaultPlace = {
  // Default map center is Tempe Public Library
  name: "Tempe Public Library",
  latitude: 33.39131450000001,
  longitude: -111.9280626,
  referencePointId: "ChIJR35tTZ8IK4cR2D0p0AxOqbg",
  address: "3500 S Rural Rd, Tempe, AZ 85282, USA",
};

const getFilterValuesFromParams = function (
  route: any,
  channelId: string
): SearchEventValues {
  // Need to re-clean data when route values change
  // Take the default filter values from the query
  // in the URL if the values exist.

  const now = DateTime.now();
  const defaultStartDateObj = now.startOf("day");
  const defaultEndDateRangeObj = defaultStartDateObj.plus({ years: 2 });
  const defaultStartDateISO = defaultStartDateObj.toISO();
  const defaultEndDateRangeISO = defaultEndDateRangeObj.toISO();

  const cleanedValues: SearchEventValues = {};

  for (const key in route.query) {
    const val = route.query[key];

    switch (key) {
      case "beginningOfDateRangeISO":
        if (typeof val === "string") {
          cleanedValues.beginningOfDateRangeISO = val;
        }
        break;
      case "endOfDateRangeISO":
        if (typeof val === "string") {
          cleanedValues.endOfDateRangeISO = val;
        }
        break;
      case "radius":
        // May need to cast to string
        if (typeof val === "number") {
          cleanedValues.radius = val;
        }
        break;
      case "latitude":
        if (typeof val === "number") {
          cleanedValues.latitude = val;
        }
        break;
      case "longitude":
        if (typeof val === "number") {
          cleanedValues.longitude = val;
        }
        break;
      case "tags":
        if (typeof val === "string") {
          cleanedValues.tags = [val];
        }
        if (typeof val === "object") {
          // If it is an array of strings, which
          // is good, then the type is an object.
          cleanedValues.tags = val;
        }
        break;
      case "channels":
        if (typeof val === "string") {
          cleanedValues.channels = [val];
        }
        if (typeof val === "object") {
          // If it is an array of strings, which
          // is good, then the type is an object.
          cleanedValues.channels = val;
        }
        break;
      case "searchInput":
        if (typeof val === "string") {
          cleanedValues.searchInput = val;
        }
        break;
      case "showCanceledEvents":
        // May need to cast to boolean
        if (typeof val === "boolean") {
          cleanedValues.showCanceledEvents = val;
        }
        break;
      case "free":
        if (typeof val === "boolean") {
          cleanedValues.free = val;
        }
        break;
      case "resultsOrder":
        if (val === resultOrderTypes.CHRONOLOGICAL) {
          cleanedValues.resultsOrder = chronologicalOrder;
        }
        if (val === resultOrderTypes.REVERSE_CHRONOLOGICAL) {
          cleanedValues.resultsOrder = reverseChronologicalOrder;
        }
        break;
      case "locationFilter":
        cleanedValues.locationFilter = val?.toString();
        break;
      case "weekdays":
        cleanedValues.weekdays = JSON.parse(val);
        break;
      case "hourRanges":
        cleanedValues.hourRanges = JSON.parse(val);
        break;
      case "weeklyHourRanges":
        cleanedValues.weeklyHourRanges = JSON.parse(val);
        break;
    }
  }

  const {
    beginningOfDateRangeISO,
    endOfDateRangeISO,
    radius,
    latitude,
    longitude,
    tags,
    channels,
    searchInput,
    showCanceledEvents,
    free,
    weekdays,
    hourRanges,
    weeklyHourRanges,
    resultsOrder,
    locationFilter,
  } = cleanedValues;

  return {
    beginningOfDateRangeISO: beginningOfDateRangeISO || defaultStartDateISO,
    endOfDateRangeISO: endOfDateRangeISO || defaultEndDateRangeISO,
    radius: radius || 500,
    latitude: latitude || defaultPlace.latitude,
    longitude: longitude || defaultPlace.longitude,
    tags: tags || [],
    channels: channels || [],
    searchInput: searchInput || "",
    showCanceledEvents: showCanceledEvents || false,
    free: free || false,
    weekdays: weekdays || createDefaultSelectedWeekdays(),
    hourRanges: hourRanges || createDefaultSelectedHourRanges(),
    weeklyHourRanges:
      weeklyHourRanges || createDefaultSelectedWeeklyHourRanges(),
    resultsOrder: resultsOrder || chronologicalOrder,
    locationFilter:
      locationFilter ||
      (channelId
        ? LocationFilterTypes.NONE
        : LocationFilterTypes.WITHIN_RADIUS),
  };
};

export  { getFilterValuesFromParams, defaultPlace } ;
