<?php
declare(strict_types=1);

function plum_render_sidebar(array $links = []): void
{
    if ($links === []) {
        return;
    }

    echo '<aside class="sidebar">';
    foreach ($links as $label => $href) {
        echo '<a href="' . e((string) $href) . '">' . e((string) $label) . '</a>';
    }
    echo '</aside>';
}
