export default async function callAndIgnoreError<T>(promise: Promise<T>): Promise<void> {
  try {
    await promise;
  } catch (error) {
    // Ignore the error
  }
}

