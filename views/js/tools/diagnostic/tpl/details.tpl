<div class="details">
    <h2>{{__ 'Details'}}</h2>
    <div>
        <table class="matrix">
            <tbody>
            {{#each this}}
                <tr><td>{{message}}</td><td>{{value}}</td></tr>
            {{/each}}
            </tbody>
        </table>
    </div>
</div>
