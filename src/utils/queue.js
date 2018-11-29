const PRIORITIES = Object.freeze({
    high: 'high',
    normal: 'normal',
    low: 'low'
});

class Queue {
    constructor(priorities = PRIORITIES) {
        this._priorities = priorities;
        this._size = 0;
        this._queues = Object.create(null);
        for (let priority in this._priorities) {
            this._queues[priority] = [];
        }
    }

    enqueue(priority, element) {
        this._queues[priority].push(element);
        this._size++;
        return this;
    }

    dequeue() {
        if (this._size > 0) {
            for (let priority in this._priorities) {
                if (this._queues[priority].length > 0) {
                    this._size--;
                    return this._queues[priority].shift();
                }
            }
        }
    }

    isEmpty() {
        return this.size() === 0;
    }

    size() {
        return this._size;
    }

}

module.exports = Queue;