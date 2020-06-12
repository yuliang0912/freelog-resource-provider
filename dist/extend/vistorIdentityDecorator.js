"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorIdentity = void 0;
function visitorIdentity(identityType) {
    return (target, name, descriptor) => {
        const oldValue = descriptor.value;
        descriptor.value = function (ctx) {
            if (ctx.validateVisitorIdentity) {
                ctx.validateVisitorIdentity(identityType);
            }
            return oldValue.apply(this, arguments);
        };
        return descriptor;
    };
}
exports.visitorIdentity = visitorIdentity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdG9ySWRlbnRpdHlEZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL3Zpc3RvcklkZW50aXR5RGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLFNBQWdCLGVBQWUsQ0FBQyxZQUFZO0lBQ3hDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDbEMsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQVE7WUFDakMsSUFBSSxHQUFHLENBQUMsdUJBQXVCLEVBQUU7Z0JBQzdCLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM3QztZQUNELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVhELDBDQVdDIn0=