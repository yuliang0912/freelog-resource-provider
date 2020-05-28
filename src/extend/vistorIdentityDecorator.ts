export function visitorIdentity(identityType) {
    return (target, name, descriptor) => {
        const oldValue = descriptor.value;
        descriptor.value = function (ctx: any) {
            if (ctx.validateVisitorIdentity) {
                ctx.validateVisitorIdentity(identityType);
            }
            return oldValue.apply(this, arguments);
        };
        return descriptor;
    };
}
