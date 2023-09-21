import { ApiProperty } from '@nestjs/swagger';
import { PostResponseDto } from './post.dto';

export class GetPostListResponseDto {
  @ApiProperty({
    example: [
      {
        postId: 1,
        userId: 1,
        categoryId: 1,
        title: 'post1',
        thumbnailImageUrl: 'thumbnailImageUrl1',
        description: 'post1',
        createdAt: '2023-09-20T16:10:18.000Z',
        updatedAt: '2023-09-20T16:10:18.000Z',
        user: {
          userId: 1,
          email: 'test1@email.com',
          nickname: 'test1',
          createdAt: '2023-09-20T16:10:02.000Z',
          updatedAt: '2023-09-20T16:10:02.000Z',
        },
        category: {
          categoryId: 1,
          title: '카테고리1',
        },
      },
    ],
    description: '카테고리 목록',
  })
  list: PostResponseDto[] | [];

  @ApiProperty({
    example: 1,
    description: '글 전체 개수',
  })
  count: number;
}
