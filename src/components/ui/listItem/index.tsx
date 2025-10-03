import { ComponentProps } from 'react';

const ListItem = (props: ComponentProps<'li'>) => {
    return <li {...props} />;
};

export default ListItem;
