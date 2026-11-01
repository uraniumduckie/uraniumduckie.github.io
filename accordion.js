const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll(".category").forEach((category) => {
  const summary = category.querySelector("summary");
  let animation = null;
  let expanded = category.open;

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    expanded = !expanded;

    const startHeight = category.getBoundingClientRect().height;
    if (animation) animation.cancel();

    category.style.height = "";
    category.open = true;
    category.classList.toggle("is-expanded", expanded);

    const styles = getComputedStyle(category);
    const closedHeight = summary.getBoundingClientRect().height
      + parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
      + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const endHeight = expanded ? category.getBoundingClientRect().height : closedHeight;

    if (reducedMotion.matches) {
      category.style.overflow = "";
      animation = null;
      category.open = expanded;
      return;
    }

    category.style.overflow = "hidden";
    animation = category.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 300, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
    );

    animation.onfinish = () => {
      category.open = expanded;
      category.style.overflow = "";
      animation = null;
    };
  });

  category.classList.toggle("is-expanded", expanded);
});
