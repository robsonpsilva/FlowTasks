

export async function getCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
  return data;
}

export async function getCategoryById(id: number) {
    const res = await fetch(`/api/categories/${id}`);
    const data = await res.json();
  return data;
}