/** 
 * 1. Interface: Defines the shape of an object.
 * Used for type-checking without requiring a class.
 */
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest'; // Union Type
}

/** 
 * 2. Generic Class: A reusable container that works with any type <T>.
 */
class DataManager<T> {
    private items: T[] = [];

    addItem(item: T): void {
        this.items.push(item);
    }

    getAll(): T[] {
        return this.items;
    }
}

/** 
 * 3. Class Implementation: Demonstrates inheritance and access modifiers.
 */
class UserService extends DataManager<User> {
    constructor(private apiEndpoint: string) {
        super();
    }

    // 4. Async Function: Simulates fetching data with a Promise
    async fetchRemoteUser(id: number): Promise<User | null> {
        console.log(`Fetching user ${id} from ${this.apiEndpoint}...`);

        // Simulated network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id,
                    name: "Jane Doe",
                    email: "jane@example.com",
                    role: "admin"
                });
            }, 500);
        });
    }
}

/** 
 * 5. Execution Logic
 */
async function main() {
    const service = new UserService("https://api.example.com");

    // Add a local user
    const newUser: User = { id: 1, name: "John", email: "john@ts.com", role: "user" };
    service.addItem(newUser);

    // Fetch and add a remote user
    const remoteUser = await service.fetchRemoteUser(2);
    if (remoteUser) {
        service.addItem(remoteUser);
    }

    // Display results
    console.log("Current Users:", service.getAll());
}

main().catch(err => console.error(err));