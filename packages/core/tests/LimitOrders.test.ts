import { User } from '../src/User/User';
import { Stock, OperationResponseStatus } from '../src/util/Datatypes';
import { OrderType, OrderStatus, AdditionalOrderType } from '../src/Order/Order';
import { Market } from '../src/Market/Market';

beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Market.instance = new Market();
    Market.getInstance().addOrderStore(Stock.TSLA);
});

it('Quantity, Price validation', () => {
    const user1 = new User('John Doe', 0, { TSLA: 5 });
    try {
        user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 0, 20);
    } catch (ex) {
        expect(ex).toBeDefined();
    }

    try {
        user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 0);
    } catch (ex) {
        expect(ex).toBeDefined();
    }
});

it('Simple Buy, Sell - Settled', () => {
    const user1 = new User('John Doe', 0, { TSLA: 5 });
    const user2 = new User('Mary Jane', 100);

    const order1 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 5, 20);
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(OrderStatus.Placed);

    const order2 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 20);
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
});

it('Simple Sell, Buy - Settled', () => {
    const user1 = new User('John Doe', 0, { TSLA: 5 });
    const user2 = new User('Mary Jane', 100);

    const order2 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 20);
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(OrderStatus.Placed);

    const order1 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 5, 20);
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
});

it('Simple Sell, Buy - Partially Settled', () => {
    const user1 = new User('John Doe', 0, { TSLA: 5 });
    const user2 = new User('Mary Jane', 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 10, 10);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 10);
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.PartiallyFilled,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getQuantitySettled() : null).toBe(5);
});

it('Buy order settled by 2 sell orders', () => {
    const user1 = new User('John Doe', 0, { TSLA: 10 });
    const user2 = new User('Mary Jane', 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 10, 10);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 10);
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.PartiallyFilled,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getQuantitySettled() : null).toBe(5);

    const order3 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 10);
    expect(order3.status === OperationResponseStatus.Success ? order3.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
});

it('Sell order settled by 2 buy orders', () => {
    const user1 = new User('John Doe', 0, { TSLA: 10 });
    const user2 = new User('Mary Jane', 100);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 10, 10);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 5, 10);
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.PartiallyFilled,
    );
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getQuantitySettled() : null).toBe(5);

    const order3 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 5, 10);
    expect(order3.status === OperationResponseStatus.Success ? order3.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
});

it('Buy order settled by 2 sell orders(with different avg. prices)', () => {
    const user1 = new User('John Doe', 0, { TSLA: 10 });
    const user2 = new User('Mary Jane', 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 10, 10);

    const order3 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 5);
    expect(order3.status === OperationResponseStatus.Success ? order3.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.PartiallyFilled,
    );

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 12);
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
});

it('Buy order settled by 2 sell orders(with different avg. prices), higher price order first.', () => {
    const user1 = new User('John Doe', 0, { TSLA: 10 });
    const user2 = new User('Mary Jane', 100);

    const order2 = user2.placeOrder(Stock.TSLA, OrderType.Buy, AdditionalOrderType.Limit, 10, 10);

    const order1 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 12);
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(OrderStatus.Placed);
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(OrderStatus.Placed);

    const order3 = user1.placeOrder(Stock.TSLA, OrderType.Sell, AdditionalOrderType.Limit, 5, 5);
    expect(order3.status === OperationResponseStatus.Success ? order3.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order2.status === OperationResponseStatus.Success ? order2.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
    expect(order1.status === OperationResponseStatus.Success ? order1.data.getStatus() : null).toBe(
        OrderStatus.Confirmed,
    );
});
