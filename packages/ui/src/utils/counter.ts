export function setupCounter(element: HTMLButtonElement) {
	let counter = 0;
	const setCounter = (count: number) => {
		counter = count;
		element.innerText = `count is ${counter}`;
	};

	const clickHandler = () => setCounter(++counter);
	element.addEventListener("click", clickHandler);
	setCounter(0);

	// Return cleanup function
	return () => {
		element.removeEventListener("click", clickHandler);
	};
}
