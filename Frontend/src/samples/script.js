document.addEventListener('DOMContentLoaded', function() {
    // Select the h1 and p elements
    const heading = document.querySelector('h1');
    const paragraph = document.querySelector('p');
    
    // Add click event listener to the h1
    heading.addEventListener('click', function() {
        heading.textContent = 'Heading Clicked!';
    });
    
    // Add click event listener to the p
    paragraph.addEventListener('click', function() {
        paragraph.textContent = 'Paragraph Clicked!';
    });
});
