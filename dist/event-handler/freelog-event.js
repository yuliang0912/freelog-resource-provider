"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreelogEvent = void 0;
const events = require("events");
const midway_1 = require("midway");
let FreelogEvent = class FreelogEvent extends events.EventEmitter {
};
FreelogEvent = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('freelogEvent')
], FreelogEvent);
exports.FreelogEvent = FreelogEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJlZWxvZy1ldmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ldmVudC1oYW5kbGVyL2ZyZWVsb2ctZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLG1DQUFzQztBQUl0QyxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsTUFBTSxDQUFDLFlBQVk7Q0FFcEQsQ0FBQTtBQUZZLFlBQVk7SUFGeEIsSUFBQSxjQUFLLEVBQUMsV0FBVyxDQUFDO0lBQ2xCLElBQUEsZ0JBQU8sRUFBQyxjQUFjLENBQUM7R0FDWCxZQUFZLENBRXhCO0FBRlksb0NBQVkifQ==